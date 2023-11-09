export type User = {
  id: number;
  created_at: string;
  name: string;
  avatar: string;
  local_id: string;
}

export type Message = {
  id: number;
  created_at: string;
  text: string;
  author_local_id: string;
  author_name: string;
}