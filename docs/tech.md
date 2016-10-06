[Back to home page](../../../)

# Technical Specification

UPDATED: 6th October 2016 - **additions** ~~deletions~~

## 1 Introduction

### 1.1 Overview

This document provides a complete overview of the technical specification Mujo Industry Portal. It is based upon the design specification.

### 1.2 Related documents

* The [Design specification](design.md) lays out the functionality of the system.
* The [User requirement specification](https://docs.google.com/document/d/1SYVugRCuzjcj8jgR8f8yrp-2E4V5km13pVF3XVbmyXY/edit) provides the detail of what is required by the user.

### 1.3 Structure

There is an architecture diagram, details of the technologies used and the web service API.

## 2 Architecture

### 2.1 Diagram

![Technical architecture ](https://github.com/rw251/analytics-portal/blob/master/docs/img/Technical architecture.png)

### 2.2 Description

The system will be designed to support a multi-server architecture though it is envisioned that due to the current scale of the project the entire system will be accommodated on a single server.

The system will be built in an OS-agnostic fashion enabling deployment on both Windows and Linux servers.

The design of the MySQL database is complete and undertaken by an external company. This is considered out of scope of this document.

## 3 Web service API

### 3.1 Overview

The web service API will allow the web application to retrieve data from the database.

### 3.2 Methods

#### 3.2.1 GET: /api/summary

Gets the summary information for the portal:

```
{
  "updated": "YYYY-MM-DD",
  "count": {
    "allpatients": a,
    "activepatients": b,
    "dischargedpatients": {
      "reason 1": c,
      "reason 2": d
    }
    "locations": e,
    "physios": f,
    "diagnoses": g,
    "prescriptions": h
  },
  "diagnostic": {
    "age": i,
    "occupation": j,
    "diagnoses": k
  }
}
```

#### 3.2.2 GET: /api/top10

Get the available categories for the top 10 data.

```
[
  "locationByNumberOfPatients",
  "physioByNumberOfPatients",
  "physioByNumberOfSuccesses",
  "failureReasonByNumberOfPatients",
  "deviceByAvgSessionTime",
  "deviceByBearingLife",
  "deviceByCableLife",
  "deviceByLoadFactor"
]
```

#### 3.2.3 GET: /api/top10/{category}

Get the top 10 data for a given category.

```
{
  "title" : "The title",
  "data" : [
    {"name" : "The name 1", "value": n1},
    {"name" : "The name 2", "value": n2},
    ...
    {"name" : "The name 10", "value": n10}
  ]
}
```

##### 3.2.3.1 GET: /api/top10/all/{category}

**Get the all data for a given category.**

```
{
  "title" : "The title",
  "data" : [
    {"name" : "The name 1", "value": n1},
    {"name" : "The name 2", "value": n2},
    ...
  ]
}
```

#### 3.2.4 GET: /api/distribution/

Get the available categories for the top 10 data.

```
[
  "age",
  "sex",
  "bmi",
  "timeOfSession",
  "prescribedExerciseFrequency"
]
```

#### 3.2.5 GET: /api/distribution/{category}

Get the distribution data for a given category.

```
{
  "title" : "The title e.g. age distribution",
  "data" : [
    {"label" : "0-9", "lower": 0, "value": n1},
    {"label" : "10-19", "lower": 10, "value": n2},
    ...
  ]
}
```

#### 3.2.6 GET: /api/model/summary

Gets the summary information for the portal:

```
{
  "updated": "YYYY-MM-DD",
  "significant" : [
    {
      "who" : "older people",
      "factor" : "less likely",
      "outcome" : "adhere to prescription",
      "p" : 0.0013
    },
    ...
  ]
}
```

#### 3.2.7 GET: /api/model?age={age}&sex={sex}&occupation={occupation}&diagnosis={diagnosis}

For a particular demographic return the likelihood of adherence and outcome.

```
[
  {
    "name" : "adherence",
    "probability" : "0.6",
    "lowerConf" : "0.4",
    "higherConf" : "0.75"
  },
  ...
]
```

#### 3.2.8 GET: /api/occupations

Returns a full list of occupations and counts in the system

```
[
  {
    "val" : "software engineer",
    "num" : "3"
  },
  {
    "val" : "solicitor",
    "num" : "2"
  },
  ...
]
```

#### 3.2.9 GET: /api/diagnoses

Returns a full list of diagnoses and counts in the system

```
[
  {
    "val" : "shoulder tear",
    "num" : "3"
  },
  {
    "val" : "bad back",
    "num" : "2"
  },
  ...
]
```

#### 3.2.10 GET: /api/sidebar

**Returns the elements in the side bar that the user has permission to view**

```
["top10", "locations", "distributions", "model"]
```

## 4 Authentication

### 4.1 Overview

**The web service calls required for Authentication**

### 4.2 User methods

#### 4.2.1 GET: /login

**Returns the login page. All unauthenticated traffic is routed here.**

#### 4.2.2 POST: /login

**Authenticates the user's email and password. Then redirects the user to the page they were originally trying to load, defaulting to /portal**

#### 4.2.3 GET: /changepassword

**Returns the change password screen**

#### 4.2.4 POST: /changepassword

**Changes the user's password**

#### 4.2.5 GET: /signout

**Signs out the user and redirects to the login screen.**

### 4.3 Admin Methods

#### 4.3.1 GET: /admin

**Returns a screen with a list of all currently registered users, with their assigned sites and roles, and links to add, edit and delete.**

#### 4.3.2 GET: /adduser

**Returns a screen to add a user by providing: full name, email address, password, roles and sites.**

#### 4.3.3 POST: /adduser

**Adds the user.**

#### 4.3.4 GET: /delete/:email

**Loads the "are you sure" screen for deleting the user account with the email address :email.**

#### 4.3.5 POST: /delete/:email

**Removes the user with email address :email.**

#### 4.3.6 GET: /edit/:email

**Loads a screen with the user's details to allow changes.**

#### 4.3.7 POST: /edit/:email

**Commits the changes to the user's account.**

## ~~4~~**5** Technologies

### ~~4~~**5**.1 API

The api will be built using [nodejs](https://nodejs.org/en/) and [express](https://expressjs.com/). Communication with the database will be via the npm module [mysql](https://www.npmjs.com/package/mysql).

**Authentication will be managed with [passportjs](http://passportjs.org/). With user account stored in a local [MongoDB](https://docs.mongodb.com/) database.**

### ~~4~~**5**.2 Web application

The web app will be served using [nodejs](https://nodejs.org/en/) and [express](https://expressjs.com/). The frontend will be built using [Bootstrap](http://getbootstrap.com/), icons from [Font-awesome](http://fontawesome.io/), side menus using [metisMenu](http://mm.onokumus.com/) and charts using [chart.js](http://www.chartjs.org/).

[NPM](https://www.npmjs.com/) will be the package manager and building and compilation will be managed using [brunch.io](http://brunch.io).

## ~~5~~**6** Testing

### ~~5~~**6**.1 Unit testing

Unit tests will be built during the construction of the web application. They will be automated via mocha to run prior to build and will also be remotely run on github commit via [travis-ci](https://travis-ci.org/rw251/analytics-portal). Code coverage will be accomplished with [istanbul](http://gotwarlost.github.io/istanbul/).

### ~~5~~**6**.2 System Testing

A system test plan will be produced during construction of the web application and fully signed off before delivery of the software.

## ~~6~~**7** Code hosting

All code will be hosted on github at [https://github.com/rw251/analytics-portal](https://github.com/rw251/analytics-portal). Issues, releases and milestones will be tracked here.
