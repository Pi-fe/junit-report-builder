import TestSuite = require('../src/test_suite');

describe('Test Suite builder', () => {
  let testSuite: TestSuite;
  let parentElement: any;
  let testSuiteElement: any;
  let propertiesElement: any;
  let testCase: any;


  beforeEach(() => {
    const factory = {
      newBuilder: jest.fn(),
      newTestSuite: jest.fn(),
      newTestCase: jest.fn(),
    };

    testCase = {
      build: jest.fn(),
      getFailureCount: jest.fn(),
      getErrorCount: jest.fn(),
      getSkippedCount: jest.fn(),
    }

    factory.newTestCase.mockImplementation(() => testCase);

    parentElement = {
      ele: jest.fn(),
    };

    testSuiteElement = {
      ele: jest.fn(),
    };
    propertiesElement = {
      ele: jest.fn(),
    };

    testSuite = new TestSuite(factory);

    parentElement.ele.mockImplementation((elementName: any) => {
      switch (elementName) {
        case 'testsuite': return testSuiteElement;
      }
    });

    testSuiteElement.ele.mockImplementation((elementName: any) => {
      switch (elementName) {
        case 'properties': return propertiesElement;
      }
    });

    testCase.getFailureCount.mockImplementation(() => 0);

    testCase.getErrorCount.mockImplementation(() => 0);

    return testCase.getSkippedCount.mockImplementation(() => 0);
  });


  it('should create a testsuite element when building', () => {
    testSuite.build(parentElement);

    return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
      tests: 0
    }));
  });


  it('should add the provided name as an attribute', () => {
    testSuite.name('suite name');

    testSuite.build(parentElement);

    return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
      name: 'suite name'
    }));
  });


  it('should count the number of testcase elements', () => {
    testSuite.testCase();

    testSuite.build(parentElement);

    return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
      tests: 1
    }));
  });


  it('should add the provided time as an attribute', () => {
    testSuite.time(12.3);

    testSuite.build(parentElement);

    return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
      time: 12.3
    }));
  });


  it('should add the provided timestamp as an attribute', () => {
    testSuite.timestamp('2014-10-21T12:36:58');

    testSuite.build(parentElement);

    return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
      timestamp: '2014-10-21T12:36:58'
    }));
  });


  it('should format the provided timestamp date and add it as an attribute', () => {
    testSuite.timestamp(new Date(2015, 10, 22, 13, 37, 59, 123));

    testSuite.build(parentElement);

    return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
      timestamp: '2015-11-22T13:37:59'
    }));
  });


  it('should add the provided property as elements', () => {
    testSuite.property('property name', 'property value');

    testSuite.build(parentElement);

    return expect(propertiesElement.ele).toHaveBeenCalledWith('property', {
      name: 'property name',
      value: 'property value'
    });
  });


  it('should add all the provided properties as elements', () => {
    testSuite.property('name 1', 'value 1');
    testSuite.property('name 2', 'value 2');

    testSuite.build(parentElement);

    expect(propertiesElement.ele).toHaveBeenCalledWith('property', {
      name: 'name 1',
      value: 'value 1'
    });
    return expect(propertiesElement.ele).toHaveBeenCalledWith('property', {
      name: 'name 2',
      value: 'value 2'
    });
  });


  it('should pass testsuite element to the test case when building', () => {
    testSuite.testCase();

    testSuite.build(parentElement);

    return expect(testCase.build).toHaveBeenCalledWith(testSuiteElement);
  });


  it('should pass testsuite element to all created test cases when building', () => {
    testSuite.testCase();
    testSuite.testCase();

    testSuite.build(parentElement);

    expect(testCase.build.mock.calls.length).toEqual(2);
    expect(testCase.build.mock.calls[0]).toEqual([testSuiteElement]);
    return expect(testCase.build.mock.calls[1]).toEqual([testSuiteElement]);
  });


  it('should return the newly created test case', () => expect(testSuite.testCase()).toEqual(testCase));


  it('should return itself when configuring property', () => expect(testSuite.property('name', 'value')).toEqual(testSuite));


  it('should return itself when configuring name', () => expect(testSuite.name('name')).toEqual(testSuite));

  describe('failure count', () => {
    it('should not report any failures when no test cases', () => {
      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        failures: 0
      }));
    });


    it('should not report any failures when no test cases failed', () => {
      testSuite.testCase();
      testSuite.testCase();

      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        failures: 0
      }));
    });


    return it('should report two failures when two test cases failed', () => {
      testCase.getFailureCount.mockImplementation(() => 1);

      testSuite.testCase();
      testSuite.testCase();

      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        failures: 2
      }));
    });
  });


  describe('error count', () => {
    it('should not report any errors when no test cases', () => {
      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        errors: 0
      }));
    });


    it('should not report any errors when no test cases errored', () => {
      testSuite.testCase();
      testSuite.testCase();

      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        errors: 0
      }));
    });


    return it('should report two errors when two test cases errored', () => {
      testCase.getErrorCount.mockImplementation(() => 1);

      testSuite.testCase();
      testSuite.testCase();

      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        errors: 2
      }));
    });
  });


  return describe('skipped count', () => {
    it('should not report any skipped when no test cases', () => {
      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        skipped: 0
      }));
    });


    it('should not report any skipped when no test cases errored', () => {
      testSuite.testCase();
      testSuite.testCase();

      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        skipped: 0
      }));
    });


    return it('should report two skipped when two test cases errored', () => {
      testCase.getSkippedCount.mockImplementation(() => 1);

      testSuite.testCase();
      testSuite.testCase();

      testSuite.build(parentElement);

      return expect(parentElement.ele).toHaveBeenCalledWith('testsuite', expect.objectContaining({
        skipped: 2
      }));
    });
  });
});
