import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TodosController } from "./todos.controller";
import { TodosService } from "./todos.service";
import { Todo } from "./todo.entity";

describe("Todos Controller", () => {
  let controller: TodosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([Todo])],
      providers: [TodosService],
      controllers: [TodosController]
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
