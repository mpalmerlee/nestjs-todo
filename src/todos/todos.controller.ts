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
