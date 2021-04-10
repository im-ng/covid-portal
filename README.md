This repo is intended for demoing the zoho catalyst capabilities in simple way to achieve the given objective.

### Objective

- The year is 2019 and COVID is just getting started, build a crowd-sourced web application using Catalyst to report covid cases. Any public user (unauthenticated) can report a covid case in their city and once reported, they'll get to see how many other people have reported covid cases in their reported city.

- Bonus: Also build a login based admin dashboard that lets an authenticated admin to view all reported covid cases, city wise.


### Getting Started

1. Clone this repo

```
git clone git@github.com:ng28/covid-portal.git
```

2. Install and verify catalyst installation

```
npm install -g zcatalyst-cli@1.5.2
catalyst --version
```

3. Install `node` dependencies for catalyst functions
   
```
cd covid-portal
cd functions/covid_portal_function
yarn install
```

4. Issue `serve` from cloned directory to preview demo app locally.

```
//Issue this command from parent folder (covid-portal)
catalyst serve
```

5. Catalyst deploy can be access through this [link](https://covidportal-747668416.development.catalystserverless.com/app/index.html)

### Admin User

shared.via.email / 1!&8ogI7

### Attributes
 
The demo app is built on top of the following open source libraries.
- Bootstrap
- Bootstrap Table
- JQuery

### References
 - [Sample Web App](https://www.zoho.com/catalyst/help/tutorials/authenticationapp)
 - [Authentication App](https://www.zoho.com/catalyst/help/tutorials/authenticationapp)