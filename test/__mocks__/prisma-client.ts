export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export type User = {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CartItem = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  deliveryAddress: string;
  contactPhone: string;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
};

export type Category = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export namespace Prisma {
  export type CartItemGetPayload<T> = CartItem & {
    product: Product;
  };

  export type OrderGetPayload<T> = Order & {
    orderItems: (OrderItem & { product: Product })[];
  };

  export type OrderItemGetPayload<T> = OrderItem & {
    product: Product;
  };
}
