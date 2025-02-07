

export interface User {
  id_user?: number;
  imagen?:string;
  name: string | null;
  email: string | null;
  password: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserResponse extends User {
}


