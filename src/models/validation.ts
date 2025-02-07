import { Response } from "./response";

export interface ValidationError {
  [key: string]: ValidationArrayError[] | undefined | null; 
}

export interface ValidationArrayError {
  [key: string]: string[] | undefined;
}

export interface ErrorValidation {
  status: boolean;
  data: Response<any>;
}
