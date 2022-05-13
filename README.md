# The Backend Part of Delivery Service App

<img alt="NestJS" src ="https://img.shields.io/badge/NestJS-v8.0.0-6.svg?&style=for-the-badge&logo=NestJS&logoColor=E0234E"/>

## Description

Delivery Service App Backend

## Using

- GraphQL
- cross-env
- TypeOrm (using Data Mapper pattern)
- bcrypt: for hashing
- class-validator
- joi :DB validatioon check
- GOT: request curl
- jsonwebtoken, types/jsonwebtoken
- Postgre v2.5.6 / postico
- Mailgun: for email verification

## User Construction:

- Entity:

  - id
  - createdAt
  - updatedAt
  - email
    - verification: uuid
  - password (hash)
  - JWT
  - role(Client|Owner|Delivery)
  - Authentication flow:
    - send Token to Header -> hit middleware
    - middleware(token decrypt & verify) -> add user request Object
    - request Object into graphql context -> guard
    - guard find graphql context if user exist or not
    - request has been authorized by guard
    - auth_decorate find user and return user Info.

## Restaurant & Order Construction:

- Entity:

  - name
  - category
  - address
  - coverImage

- Functions

  - Pagination
    - See Restaurants
  - Create/Edit/Delete Restaurant (Role based)
  - Create/Edit/Delete Dish (Role based)
  - Order Dish
  - Search Restaurants (Role based)
  - Order and Subscriptions
  - use graphql-subscriptions
  - Owner: pendig Orders
    - trigger: createOrder
      - restaurant owner listening newOeder event
      - when food is ready(by owner) and ready to pickup, then trigger ceareOrder
  - Customer:
    - Order Status (customer, Delivery, Owner)
    - trigger:editOrder -> orderupdate
      - customer,owner listening orderUpdate event
  - Driever(Delivery):Pending pickup Orders
    - this function for only Driever
    - when order cooked Delivery listening orderUpdate

- <b>Unit Test</b>

  - Jest

    - create account
    - login
    - find by Id
    - edit profile
    - verify email / JWT
    - coverage: see below

      | File             | % Stmts | % Branch | % Funcs | % Lines |
      | ---------------- | ------- | -------- | ------- | ------- |
      | All files        | 87      | 100      | 92.31   | 89.01   |
      | jwt              | 100     | 100      | 100     | 100     |
      | jwt.service.ts   | 100     | 100      | 100     | 100     |
      | mail             | 95      | 100      | 75      | 100     |
      | mail.service.ts  | 95      | 100      | 75      | 100     |
      | users            | 100     | 100      | 100     | 100     |
      | users.service.ts | 100     | 100      | 100     | 100     |

- <b>E2E test</b>

  - Jest
    - User module
      - createAccount
      - login
      - userProfile
      - editProfile
      - verifyEmail
