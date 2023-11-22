import type {FC} from 'react';
import React, { useEffect, useState} from 'react';
import { supabaseClient as supabase } from './utils/supabase';
import type {User} from "~/types";

const UserCursorLabel: FC<{ position: {x: number; y: number}; user: User }> = ({ user, position }) => {
  return (
    <div
      className="pointer-events-none absolute text-xs flex items-center justify-center gap-2 w-[80px] h-[25px] rounded bg-sky-300 text-sky-800"
      style={{
        left: position.x,
        top: position.y + 20,
      }}
    >
      <img
        className="h-[15px] w-[15px] rounded-full ring-2 ring-white object-cover"
        src={user.avatar}
        alt={user.name}
      />
      {user.name}
    </div>
  )
}

const UserCursorLabel2: FC<{ position: {x: number; y: number}; user: User }> = ({ user, position }) => {
  return (
    <div
      className="pointer-events-none absolute text-xs flex items-center justify-center gap-2 w-[80px] h-[25px]  rounded bg-red-300 text-red-800"
      style={{
        left: position.x,
        top: position.y + 20,
      }}
    >
      <img
        className="h-[15px] w-[15px] rounded-full ring-2 ring-white object-cover"
        src={user.avatar}
        alt={user.name}
      />
      {user.name}
    </div>
  )
}

const Playground: FC<{user: User, data: any, users: User[]}> = ({ user, data, users }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const updateCursorPosition = async (x: number, y: number) => {
    try {
      await supabase
        .from('cursor_positions')
        .update({ x, y })
        .eq('user_id', user.id);

    } catch (error) {}
  };


  const handleMouseMove = (event: any) => {
    const { clientX, clientY } = event;
    setPosition({ x: clientX, y: clientY });

    updateCursorPosition(clientX, clientY);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const renderCursors = () => {
    return data.filter((cursor: any) => Number(cursor.user_id) !== user.id).map((cursor: any) => (
      <UserCursorLabel2 key={cursor.user_id} position={cursor} user={users.find(user => user.id === Number(cursor.user_id))} />
    ));
  };

  return (
    <>
      {renderCursors()}
      <UserCursorLabel position={position} user={user} />
    </>
  );
};

export default Playground;