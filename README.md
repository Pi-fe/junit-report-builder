junit-report-builder
====================

[![Build Status](https://travis-ci.org/davidparsson/junit-report-builder.svg?branch=master)](https://travis-ci.org/davidparsson/junit-report-builder)
[![Dependency Status](https://david-dm.org/davidparsson/junit-report-builder.svg)](https://david-dm.org/davidparsson/junit-report-builder)
[![devDependency Status](https://david-dm.org/davidparsson/junit-report-builder/dev-status.svg)](https://david-dm.org/davidparsson/junit-report-builder#info=devDependencies)

A project aimed at making it easier to build [Jenkins](http://jenkins-ci.org/) compatible XML based JUnit reports.

Installation
------------

To install the latest version, run:

    npm install junit-report-builder --save

Usage
-----

```JavaScript
var builder = require('junit-report-builder');

// Create a test suite
var suite = builder.testSuite().name('My suite');

// Create a test case
var testCase = suite.testCase()
  .className('my.test.Class')
  .name('My first test');

// Create another test case which is marked as failed
var testCase = suite.testCase()
  .className('my.test.Class')
  .name('My second test')
  .failure();

builder.writeTo('test-report.xml');
```

This will create `test-report.xml` containing the following:

```XML
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="My suite">
    <testcase classname="my.test.Class" name="My first test"/>
    <testcase classname="my.test.Class" name="My second test">
      <failure/>
    </testcase>
  </testsuite>
</testsuites>
```

If you want to create another report file, start by getting a new
builder instance like this:
```JavaScript
builder = builder.newBuilder();
```

For more details, see the [API documentation](API.md).

License
-------

[MIT](LICENSE)

Changelog
---------

### 1.0.0
- Simplified API by making the index module export a builder instance

### 0.0.2
- Corrected example in readme

### 0.0.1
- Initial release
