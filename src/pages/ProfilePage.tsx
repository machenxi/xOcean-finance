import React, { useEffect } from 'react';
import { UserProfile } from '@/components/profile/UserProfile';

interface ProfilePageProps {
  className?: string;
}

export function ProfilePage({ className }: ProfilePageProps) {
  // Set page title
  useEffect(() => {
    document.title = 'User Profile - xOcean';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'View and manage your xOcean lending and borrowing profile');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <UserProfile className={className} />
      </div>
    </div>
  );
}

export default ProfilePage;