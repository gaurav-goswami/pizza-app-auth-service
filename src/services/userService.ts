import { Repository } from "typeorm";
import { User } from "../entity/User";
import { IUserQueryParams, LimitedUserData, UserData } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { Roles } from "../constants";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role = Roles.CUSTOMER,
    tenantId,
  }: UserData) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      const error = createHttpError(400, "Email Id already exists");
      throw error;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        tenant: tenantId ? { id: tenantId } : undefined,
      });
    } catch (err) {
      const error = createHttpError(500, "Failed to store data in database");
      throw error;
    }
  }

  async findByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ["id", "firstName", "lastName", "email", "role", "password"],
    });
  }

  async findById(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: { tenant: true },
    });
  }

  async getAllUsers(validatedQuery: IUserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder();
    const result = await queryBuilder
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .getManyAndCount();

    return result;
  }

  async userById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(userId: number, { firstName, lastName, role }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to update the user in the database",
      );
      throw error;
    }
  }

  async deleteById(userId: number) {
    try {
      return await this.userRepository.delete(userId);
    } catch (err) {
      const error = createHttpError(500, "Failed to delete user");
      throw error;
    }
  }
}
