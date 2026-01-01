export interface FormData {
  firstName: string;
  surname: string;
  cellphone: string;
  email: string;
  address: string;
  suburb: string;
  province: string;
  temple: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface User {
  _id: string;
  firstName: string;
  surname: string;
  cellphone: string;
  email?: string;
  address: string;
  suburb: string;
  province: string;
  temple: string;
  registrationDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

