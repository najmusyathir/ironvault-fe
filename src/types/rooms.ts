// Room types for Iron Vault application
import { User } from './auth';

export enum RoomRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  CREATOR = 'creator'
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface Room {
  id: number;
  name: string;
  description?: string;
  creator_id: number;
  is_private: boolean;
  max_members: number;
  current_members: number;
  created_at: string;
  updated_at: string;
  creator?: User;
  is_member?: boolean;
  user_role?: RoomRole;
}

export interface RoomMember {
  id: number;
  user_id: number;
  room_id: number;
  role: RoomRole;
  joined_at: string;
  user?: User;
}

export interface RoomInvitation {
  id: number;
  room_id: number;
  inviter_id: number;
  invitee_email: string;
  status: InvitationStatus;
  message?: string;
  created_at: string;
  expires_at: string;
  room?: Room;
  inviter?: User;
}

export interface RoomInviteCode {
  id: number;
  room_id: number;
  code: string;
  max_uses?: number;
  current_uses: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  room?: Room;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  is_private?: boolean;
  max_members: number;
}

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  is_private?: boolean;
  max_members?: number;
}

export interface CreateRoomInviteRequest {
  invitee_email: string;
  message?: string;
}

export interface CreateRoomInviteCodeRequest {
  max_uses?: number;
  expires_hours?: number;
}

export interface RoomMemberManagementRequest {
  user_id: number;
  role?: RoomRole;
}

export interface RoomApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}