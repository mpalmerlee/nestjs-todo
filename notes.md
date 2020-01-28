
# Getting started:

https://docs.nestjs.com/first-steps
$ nest new todos

Choose npm for this walkthrough because the documentation uses npm

```
$ cd todos
$ npm run start
```

navigate to:
http://localhost:3000/

"Hello World!"


# TODOs controller

Let's use the NestJS CLI to create our first controller which will generate our routing scaffolding

```
$ nest g controller todos
```

Note that it added the todos directory, a todos.controller.ts file and a todos.controller.spec.ts file for our tests.

Also notice that it updated the app.module.ts file, so that the root app knows about the controller.

We will adjust this later once we make our controller more comprehensive.

Also notice that the controller is empty, it doesn't support any operations against the /todos route, which we could start adding. But first let's start adding some details for our database and a todo entity to save.


# TypeORM

We're going to follow the steps here:
https://docs.nestjs.com/techniques/database

However I prefer postgres over mysql so I'll make the appropriate changes

```
$ npm install --save @nestjs/typeorm typeorm pg
```

Add database connection to imports in app.module.ts:

```
TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "todo",
      entities: [],
      synchronize: true
    })
```

Once we have that we can navigate down to the Repository Pattern section:
https://docs.nestjs.com/techniques/database#repository-pattern

To start adding our entity files

Make a new file called todo.entity.ts:

```
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  title: string;

  @Column()
  completed: boolean;
}
```



Next we'll follow the documentation and make sure the database configuration knows about our Todo entity:

app.module.ts:

```
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TodosController } from './todos/todos.controller';
import { Todo } from "./todos/todo.entity";


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "todo",
      entities: [Todo],
      synchronize: true
    })
  ],
  controllers: [AppController, TodosController],
  providers: [AppService]
})
export class AppModule {}
```

Next we must make a todos.module.ts file to bring our together our controllers and providers (services, etc...):

We can do that quickly using the cli:

```
$ nest g module todos
```

Notice that created our module file and registered the module with the main app root module.

Our todos.module.ts file has just the empty boilerplate for a module, but before we fill that out we also need to reference our service in the module, so let's create that via the cli as well:

```
$ nest g service todos
```

Let's fill out the module per the TypeORM section of the documentation:

todos.module.ts:
```
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TodosService } from "./todos.service";
import { TodosController } from "./todos.controller";
import { Todo } from "./todo.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  providers: [TodosService],
  controllers: [TodosController]
})
export class TodosModule {}

```

We can skip filling out the body of the service file (todos.service.ts) for now because we will fill the detials in the next step with our CRUD utilities package.


# CRUD utilities


Now that we have TypeORM setup and our scafolding for our todo module, service and controller, we can use this package to quickly get some standard CRUD endpoints setup:
https://docs.nestjs.com/recipes/crud-utilities

```
$ npm i --save @nestjsx/crud @nestjsx/crud-typeorm typeorm class-transformer class-validator
```

Fill out our service details based on the CRUD utilities documentation:

todos.service.ts:
```
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Todo } from "./todo.entity";

@Injectable()
export class TodosService extends TypeOrmCrudService<Todo> {
  constructor(@InjectRepository(Todo) repo) {
    super(repo);
  }
}
```

As well as our controller:
todos.controller.ts:
```
import { Controller } from "@nestjs/common";
import { Crud } from "@nestjsx/crud";
import { Todo } from "./todo.entity";
import { TodosService } from "./todos.service";

@Crud({
  model: {
    type: Todo
  }
})
@Controller("todos")
export class TodosController {
  constructor(public service: TodosService) {}
}
```

Our todos.module.ts file shouldn't need any changes, it is already setup for TypeORM with the Todo entity.

Now let's fire up our server and see if things are working:

```
$ npm start
```

Oops... what went wrong:
`Nest can't resolve dependencies of the TodosController...`
The error message is pretty descriptive, the issue is that both the Todos controller and the Todos module are referenced by the root app module, and we only need the Todos module since it encapsulates the controller.


Now our app.module.ts file should look like this:
```
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Todo } from "./todos/todo.entity";
import { TodosModule } from "./todos/todos.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "todo",
      entities: [Todo],
      synchronize: true
    }),
    TodosModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

Now when we start our server things look better:

```
$ npm start
```

We can hit some of these endpoints in Postman or cURL:

```
curl 'http://localhost:3000/todos/'
```

```
curl --location --request POST 'http://localhost:3000/todos/' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "get groceries",
  "completed": false
}'
```

```
curl 'http://localhost:3000/todos/'
```

The CRUD utilities also gives us fancy additions like bulk endpoints, paging, searching, etc... out of the box!

That's great, but now let's get some API documentation going so we can see all our routes.

# OpenAPI (Swagger)

https://docs.nestjs.com/recipes/swagger

Let's follow the instructions and get swagger setup so we have nice API documenation:
```
$ npm install --save @nestjs/swagger swagger-ui-express
```

Now update our main.ts file with the swagger bootstrap code:

main.ts:
```
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle("NestJS Todo example")
    .setDescription("The todos API description")
    .setVersion("1.0")
    .addTag("todo")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap();
```


Now let's start the server and see what we have:

```
$ npm start
```

Navigate to:
http://localhost:3000/api/

Notice all the nice routes that have been generated for us, you can click in on the POST /todos route and notice how swagger doesn't know the shape of the payload/schema.
We'll fix that now.

The documentation here:
https://docs.nestjs.com/recipes/swagger#route-parameters

Shows how you can specify the DTO (Data Transfer Object) schema for the endpoint (more on that here: https://docs.nestjs.com/controllers#request-payloads)

Which is great, but for our uses, since we don't require complex transformations between the request payload (DTO) and the entity that will be inserted in the database, we can simply mark up our entity with the ApiProperty decorator supplied by swagger.

Update our todo.entity.ts file as required:
```
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ length: 500 })
  title: string;

  @ApiProperty()
  @Column()
  completed: boolean;
}
```

Restart our server:

```
$ npm start
```

Refresh our swagger page: http://localhost:3000/api/ and notice how we now have title and completed flags show up in the schema!


# Run Jest tests

Run tests to check out what we have

```
$ npm test
```

You'll notice some failues in the boilerplate tests, which I spent time trying to fix, the documentation is a bit sparse on the proper fix to make this work, but essentially you need to have your `createTestingModule` mirror what the real module should do:
https://github.com/nestjs/nest/issues/2450

So we need to add this bit for both todos.controller.spec.ts and todos.service.spec.ts:
```
const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([Todo])],
      providers: [TodosService],
      controllers: [TodosController]
    }).compile();
```

Finally when we run tests again, we notice that there is a missing configuration file that TypeORM expects, we can make this automatic by setting up the configuration module in Nest and by following the techniques in this article:
https://medium.com/@gausmann.simon/nestjs-typeorm-and-postgresql-full-example-development-and-project-setup-working-with-database-c1a2b1b11b8f

For now we can just create an ormconfig.json file with the following contents:
```
{
  "type": "postgres",
  "host": "127.0.0.1",
  "port": 5432,
  "username": "postgres",
  "password": "postgres",
  "database": "todo",
  "entities": ["**/*.entity{.ts,.js}"],
  "migrations": ["src/migration/*.ts"],
  "cli": {
    "migrationsDir": "src/migration"
  },
  "synchronize": true,
  "logging": false,
  "ssl": false
}

```

# Let's see this api in our frontend

Now for a bonus to show off my shiny new api I've updated a todo MVC app to call into my API:
http://localhost:8080/#/

In order to do that from my local host we need to add CORS support so I can invoke my APIs from a web server host serving on a different port:
https://docs.nestjs.com/techniques/security#cors

Simply add this line to the main.ts file:
```
app.enableCors();
```

