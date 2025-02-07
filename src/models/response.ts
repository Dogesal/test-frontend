import { ValidationError } from "./validation";

export type Response<T> = {
  data: T;
  status: boolean;
  message: string;
  validations: ValidationError;
  execute?: Function;
}
