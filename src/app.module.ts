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
