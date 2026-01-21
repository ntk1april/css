'use client';
import React from 'react';
import Main from './components/main/page'

export default function Home  () {
  const handleSuccess = () => {
    window.location.href = '/purchase';
  };

  return (
    <div>
      <Main />
    </div>
  );
}
