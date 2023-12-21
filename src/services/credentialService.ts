import bcrypt from "bcryptjs";

export class CredentialService {
  async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
