# simple-api

## Install/Start

- `npm i`
- `npm run start`
- `curl localhost:3000/users-transactions/1`
- `curl localhost:3000/users-relations/2`

API Pass Through Application

There's clear room for improvement on this, but due to the fact that we're using a JSON format to build our relations, the best way would be to build something like a balanced-tree so you could easily check with object destructuring.

I opted for a bit of a more functional approach(most functions can easily b e curried, or encapsulate eachother).  Primarily I wanted to show a solid understanding of testing, types, and understanding of neeeds.

I think it would be easier to build junction tables(you could even do it with noSQL), and then hydrate junction tables as transactions accrue so you could easily build modeling from meta data of an event than direct data comparison of the entire object.

Alternatively, you could build a caching layer with Elastic or something of that nature on top of this to help identify these events if time was less of a factor


## Steps I Took In Development

1. I inited the project with basic typescript and my preference of ESLint rules that help with readonly typing and prevent mutability.
2. I first hit the sample endpoint, and copied and pasted the JSON response into https://quicktype.io and generated Typescript types.  I also converted these into readonly types instead of interfaces to create a rock solid typing base to extend from.
3. I created `aggregateById.test.ts` first in order to put in the test requirements for the application
4. I installed Jest, as it's the most commonly used library for almost every company I've worked with in the past 5 years.
5. I created a simple fetch request to retrieve the data from the api endpoint and checked it against types to make sure all's good!
6. After I checked the API endpoint, I built the mapRelatedTransactions.  I was able to re-use functions from previous calls
7. I added a query function by deviceId.

## Development decisions

- because the criteria for this test was tests, I wrote this test in TDD writing my expectations first
- I wrote this application as a ladder, so that each previous step would build into the next step.
- I tried to follow the philosophy of "Do one thing and do it well" which resulted in using extremely specific mapping functions, instead of the DRY philosophy, being able to test every section was important there.
- I started kind of running out of time, so I declined on turning `deviceRelation` and `transactionRelation` into their own functions.

## Fraud identifications

I did notice that the deviceId `F210200` had multiple customerId's utilizing it which I do believe indicates there may ahve been fraud
