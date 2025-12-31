/**
 * Entidad: Usuario
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  /**
   * Crear desde DTO
   */
  static fromDTO(dto: UserDTO): User {
    return new User(
      dto.id,
      dto.email,
      dto.name,
      new Date(dto.createdAt),
    );
  }

  /**
   * Convertir a DTO
   */
  toDTO(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt.toISOString(),
    };
  }

  /**
   * Obtener iniciales para avatar
   */
  getInitials(): string {
    const names = this.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}

/**
 * DTO para API response
 */
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
