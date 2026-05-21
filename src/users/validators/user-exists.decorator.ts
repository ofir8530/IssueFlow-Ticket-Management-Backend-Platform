import { registerDecorator, ValidationOptions } from 'class-validator';
import { UserExistsConstraint } from './user-exists.validator';

export function UserExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UserExistsConstraint,
    });
  };
}