import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TodosService } from "./todos.service";
import { Todo } from "./todo.entity";
import { TodosController } from "./todos.controller";

describe("TodosService", () => {
  let service: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(), TypeOrmModule.forFeature([Todo])],
      providers: [TodosService],
      controllers: [TodosController]
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
