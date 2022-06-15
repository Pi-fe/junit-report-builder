let builder = require('junit-report-builder');
const rmdir = require('rimraf');
const fs = require('fs');

describe('JUnit Report builder', () => {

  beforeEach(() => {
    builder = builder.newBuilder();
  });

  beforeAll((done: () => any) => {
    rmdir('build/tmp/test_resources', (error: any) => {
      if (error) {
        throw new Error(error);
      }
      return done();
    });
  });

  const reportWith = (content: string) => {
    return `
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  ${content.trim()}
</testsuites>
    `.trim();
  };

  it('should produce a report identical to the expected one', () => {
    builder.testCase().className("root.test.Class1");
    const suite1 = builder.testSuite().name("first.Suite");
    suite1.testCase().name("Second test");
    suite1.testCase().className("suite1.test.Class2").name("Third test").file("./path-to/the-test-file.coffee");
    const suite2 = builder.testSuite().name("second.Suite");
    suite2.testCase().failure("Failure message");
    suite2.testCase().stacktrace("Stacktrace");
    suite2.testCase().skipped();

    builder.writeTo('build/tmp/test_resources/actual_report.xml');

    const actual = fs.readFileSync('build/tmp/test_resources/actual_report.xml')
      .toString().trim();
    const expected = fs.readFileSync('spec/expected_report.xml').toString().trim();

    expect(actual).toBe(expected);
  });


  it('should produce an empty list of test suites when nothing reported', () => expect(builder.build()).toBe(`
<?xml version="1.0" encoding="UTF-8"?>
<testsuites/>
      `.trim()));


  it('should produce an empty test suite when a test suite reported', () => {
    builder.testSuite();

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="0" failures="0" errors="0" skipped="0"/>
      `)
    );
  });


  it('should produce a root test case when reported', () => {
    builder.testCase();

    expect(builder.build()).toBe(reportWith(`
  <testcase/>
      `)
    );
  });


  it('should produce a root test case with failure when reported', () => {
    builder.testCase().failure('it failed');

    expect(builder.build()).toBe(reportWith(`
  <testcase>
    <failure message="it failed"/>
  </testcase>
      `)
    );
  });


  it('should produce a root test case with failure and type when reported', () => {
    builder.testCase().failure('it failed', 'the type');

    expect(builder.build()).toBe(reportWith(`
  <testcase>
    <failure message="it failed" type="the type"/>
  </testcase>
      `)
    );
  });


  it('should produce a root test case with error when reported', () => {
    builder.testCase().error('it errored');

    expect(builder.build()).toBe(reportWith(`
  <testcase>
    <error message="it errored"/>
  </testcase>
      `)
    );
  });


  it('should produce a root test case with error, type and content when reported', () => {
    builder.testCase().error('it errored', 'the type', 'the content');

    expect(builder.build()).toBe(reportWith(`
  <testcase>
    <error message="it errored" type="the type"><![CDATA[the content]]></error>
  </testcase>
      `)
    );
  });


  it('should produce a test suite with a test case when reported', () => {
    builder.testSuite().testCase();

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="1" failures="0" errors="0" skipped="0">
    <testcase/>
  </testsuite>
      `)
    );
  });


  it('should produce a test suite with a failed test case when reported', () => {
    builder.testSuite().testCase().failure();

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="1" failures="1" errors="0" skipped="0">
    <testcase>
      <failure/>
    </testcase>
  </testsuite>
      `)
    );
  });


  it('should produce a test suite with an errored test case when reported', () => {
    builder.testSuite().testCase().error();

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="1" failures="0" errors="1" skipped="0">
    <testcase>
      <error/>
    </testcase>
  </testsuite>
      `)
    );
  });


  it('should produce a test suite with a skipped test case when reported', () => {
    builder.testSuite().testCase().skipped();

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="1" failures="0" errors="0" skipped="1">
    <testcase>
      <skipped/>
    </testcase>
  </testsuite>
      `)
    );
  });


  it('should add the reported time to the test sute', () => {
    builder.testSuite().time(2.5);

    expect(builder.build()).toBe(reportWith(`
  <testsuite time="2.5" tests="0" failures="0" errors="0" skipped="0"/>
      `)
    );
  });


  it('should add the reported timestamp to the test sute', () => {
    builder.testSuite().timestamp(new Date(2015, 10, 22, 13, 37, 59, 123));

    expect(builder.build()).toBe(reportWith(`
  <testsuite timestamp="2015-11-22T13:37:59" tests="0" failures="0" errors="0" skipped="0"/>
      `)
    );
  });


  it('should add the reported time to the test case', () => {
    builder.testSuite().testCase().time(2.5);

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="1" failures="0" errors="0" skipped="0">
    <testcase time="2.5"/>
  </testsuite>
      `)
    );
  });


  it('should print the reported standard output log to system-out', () => {
    builder.testSuite().testCase().standardOutput("This was written to stdout!");

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="1" failures="0" errors="0" skipped="0">
    <testcase>
      <system-out><![CDATA[This was written to stdout!]]></system-out>
    </testcase>
  </testsuite>
      `)
    );
  });


  it('should print the reported standard error log to system-err', () => {
    builder.testSuite().testCase().standardError("This was written to stderr!");

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="1" failures="0" errors="0" skipped="0">
    <testcase>
      <system-err><![CDATA[This was written to stderr!]]></system-err>
    </testcase>
  </testsuite>
      `)
    );
  });

  it('should print the reported attachment to system-err', () => {
    builder.testSuite().testCase()
      .standardError("This was written to stderr!")
      .errorAttachment("absolute/path/to/attachment");

    expect(builder.build()).toBe(reportWith(`
  <testsuite tests="1" failures="0" errors="0" skipped="0">
    <testcase>
      <system-err>
        <![CDATA[This was written to stderr!]]>
        [[ATTACHMENT|absolute/path/to/attachment]]
      </system-err>
    </testcase>
  </testsuite>
      `)
    );
  });

  it('should output test suites and test cases in the order reported', () => {
    builder.testCase().name(1);
    builder.testSuite().name(2);
    builder.testCase().name(3);

    expect(builder.build()).toBe(reportWith(`
  <testcase name="1"/>
  <testsuite name="2" tests="0" failures="0" errors="0" skipped="0"/>
  <testcase name="3"/>
      `)
    );
  });


  it('should builder supports emojis in cdata tags', () => {
    builder.testCase().standardOutput('Emoji: 🤦');

    expect(builder.build()).toBe(reportWith(`
  <testcase>
    <system-out><![CDATA[Emoji: 🤦]]></system-out>
  </testcase>
      `)
    );
  });

  it('should escape quotes', () => {
    builder.testCase().error('it is "quoted"');

    expect(builder.build()).toBe(reportWith(`
  <testcase>
    <error message="it is &quot;quoted&quot;"/>
  </testcase>
      `)
    );
  });

  it('should remove invalid characters', () => {
    builder.testCase().error('Invalid\x00Characters\x08Stripped');

    expect(builder.build()).toBe(reportWith(`
  <testcase>
    <error message="InvalidCharactersStripped"/>
  </testcase>
      `)
    );
  });
});
