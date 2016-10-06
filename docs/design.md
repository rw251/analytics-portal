[Back to home page](../../../)

# Design Specification

UPDATED: 6th October 2016 - **additions** ~~deletions~~

## 1 Introduction

### 1.1 Overview

This document provides a complete overview of the design and functionality of the Mujo Industry Portal. It is based upon the use cases, user requirement specification, and collaboration with the Mujo team.

### 1.2 Related documents

* The [Technical specification](tech.md) lays out precisely how the application will be built, tested and deployed.
* The [User requirement specification](https://docs.google.com/document/d/1SYVugRCuzjcj8jgR8f8yrp-2E4V5km13pVF3XVbmyXY/edit) provides the detail of what is required by the user.

### 1.3 Structure

The full functionality of the web application is described in detail below screen by screen.

For each screen there is:

- A description providing a detailed overview of the screen's functionality
- A graphical mock-up providing a visual alternative to the written description
- Comments on how the application would look when displayed on smaller screens such as a tablet

### 1.4 Responsive design

The application is designed to work on laptops and desktops, but will also work on tablets

### 1.5 Browser support

It is expected that the web application will work on all modern browsers, however it will only be tested on Chrome, Firefox, Edge, IE9+ and Safari.

## 2 Screens

### 2.1 Home page

[Issue #2 - create homepage](https://github.com/rw251/analytics-portal/issues/2)

#### Description

The home page provides the landing page for when users arrive at the dashboard. It will contain high level text (to be provided by Mujo) explaining what the dashboard is and how it fits within the project.

**Users can gain access to the portal by logging in with their email address and password.**

~~A title bar at the top of the screen provides access to the dashboard - as does a large button in the centre of the screen. There are two options in the title bar: Home and Analtics Portal. The currently viewed page is underlined.~~

~~A future version may have the ability for users to log in. There would then be a drop down menu in the top right showing who is logged in and allowing users to change/delete their profile and log out. However this will not be delivered as part of the current project.~~

#### Mock-up

![Home screen image ](https://github.com/rw251/analytics-portal/blob/master/docs/img/1-Base - home.jpg)

**In addition a login form will be presented in the centre of the screen.**

#### Responsive design

~~Below a certain screen size the name "Industry Portal" in the title bar will shrink to just "Portal".~~

If there are multiple columns of text then they will collapse into a single column.

### 2.2 Dashboard overview

[Issue #3 - create overview page](https://github.com/rw251/analytics-portal/issues/3)

#### Description

The user is presented with an overview of the various features in the dashboard.

A menu on the left hand side provides the ~~four~~ areas of the dashboard that are available to the user:

* overview
* top 10
* **locations**
* distributions
* predictive model

The side menu highlights the currently viewed section.

The main body of the page displays a summary box giving **some or all of** the following information **depending on the user's role**:

* When the data was last updated
* Total number of patients (and number who are active)
* **The number of discharged patients for each outcome**
  * **dischaged with improvement**
  * **dischaged without improvement**
  * **referred for surgery**
  * **failure**
* The total number of locations, physios, **and diagnoses**~~prescriptions~~
* **The proportion of complete age, occupation and diagnosis fields**

There is then also the first few elements from the "top 10" and the "distributions" pages, with a link to see more taking the user to the relevant section of the dashboard.

#### Mock-up

![Dashboard overview image](https://github.com/rw251/analytics-portal/blob/master/docs/img/2-Portal - overview.jpg)

**Not shown in the mockup:**

* **Additional summary information**
* **The locations tab**

#### Responsive design

The side bar will collapse below a certain screen size and be available via a menu button on the title bar. Upon clicking the menu button the side bar will appear and disappear on selection of an item.

### 2.3 Top 10

[Issue #4 - create top 10 page](https://github.com/rw251/analytics-portal/issues/4)

#### Description

The user is presented with a variety of information in the form of "top 10" column charts.

The current planned list of charts is:

~~`TODO: This table is incomplete`~~

| x-axis                   | y-axis                 |
|--------------------------|------------------------|
| Location                 | # of patients          |
| ~~Prescription~~         | ~~# of patients~~      |
| Physio                   | # of patients          |
| **Physio**               | **Successful outcome** |
| ~~Occupation~~           | ~~# of patients~~      |
| **Device**               | **Avg session time**   |
| **Device**               | **Bearing life**       |
| **Device**               | **Cable life**         |
| **Failure reason**       | **# of patients**      |

**The user can toggle between a table and a bar chart. In table mode they can request to see all categories rather than just the top 10.**

#### Mock-up

![top 10 image](https://github.com/rw251/analytics-portal/blob/master/docs/img/3-Portal - top 10.jpg)

**Not shown in the mock-up**

* **Ability to toggle between table and chart**
* **Ability to see more than the top 10**

#### Responsive design

The number of columns will adapt depending on screen size from a maximum of ~~4~~ **2** down to 1 for mobiles.

### 2.4 Locations

#### Description

**The user is presented with a heat map showing the location of patients, together with markers showing the list of sites.**

#### Mock-up

![](https://github.com/rw251/analytics-portal/blob/master/docs/img/location.png)

#### Responsive design

**The map will size according to the dimensions available on the screen.**

### 2.~~4~~**5** Distributions

[Issue #5 - create distribution page](https://github.com/rw251/analytics-portal/issues/5)

#### Description

The user is presented with distributions of key variables.

The current proposal is for histograms for: age, BMI and usage per hour. Also a pie chart for sex.

It is also possible for the user to alter the list of patients displayed in the distributions by adding a series of filters. Precisely what will be useful to filter on is largely dependent on the amount of data captured but it is envisioned that possible filters will include: age, sex, prescription and adherence. `This is considered a nice-to-have feature and priority will be given to other features.`

#### Mock-up

![](https://github.com/rw251/analytics-portal/blob/master/docs/img/4-Portal - distributions.jpg)
![](https://github.com/rw251/analytics-portal/blob/master/docs/img/5-Portal - distributions - drop downs.jpg)
![](https://github.com/rw251/analytics-portal/blob/master/docs/img/6-Portal - distributions - drop downs2.jpg)
![](https://github.com/rw251/analytics-portal/blob/master/docs/img/7-Portal - distributions - drop downs3.jpg)

#### Responsive design

The number of columns will adapt depending on screen size from a maximum of 4 down to 1 for mobiles.

### 2.~~5~~**6** Predictive model

[Issue #6 - create model page](https://github.com/rw251/analytics-portal/issues/6)

#### Description

A predictive model will be developed to give indications about the factors that predict adherence and outcome.

Any statistically significant factors will be displayed to the user together with the [p-value](https://en.wikipedia.org/wiki/P-value) (a measure of how significant the factor is).

It will also be possible to specify a patient by one or more of: age, sex, occupation and diagnosis, in order that a probability of adherence and successful outcome can be displayed to the user.

#### Mock-up

![](https://github.com/rw251/analytics-portal/blob/master/docs/img/8-Portal - model.jpg)
![](https://github.com/rw251/analytics-portal/blob/master/docs/img/9-Portal - model - 2.jpg)

#### Responsive design

The two column design from the mock-up would collapse to a single column below a certain screen size.
