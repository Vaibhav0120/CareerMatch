
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/use-user-role';
import type { Role } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const router = useRouter();
  const { setRole } = useUserRole();
  const { toast } = useToast();

  const handleLogin = () => {
    let role: Role | null = null;
    let redirectPath: string | null = null;
    const input = emailOrUsername.toLowerCase();

    if ((input === 'student@test.com' || input === 'student') && password === '12345678') {
      role = 'student';
      redirectPath = '/home';
    } else if ((input === 'host@test.com' || input === 'host') && password === '12345678') {
      role = 'host';
      redirectPath = '/host';
    } else if ((input === 'admin@test.com' || input === 'admin') && password === '12345678') {
      role = 'admin';
      redirectPath = '/admin';
    }

    if (role && redirectPath) {
      setRole(role);
      router.push(redirectPath);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Credentials',
        description: 'Please check your email/username and password.',
      });
    }
  };

  const handlePasswordReset = () => {
    // UI only for now
    toast({
      title: 'Password Reset Link Sent',
      description: `If an account exists for ${resetEmail}, a reset link has been sent.`,
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Log In</CardTitle>
        <CardDescription>
          Enter your email or username below to log in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email or Username</Label>
          <Input
            id="email"
            type="text"
            placeholder="m@example.com or username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="ml-auto p-0 h-auto text-sm underline">
                  Forgot your password?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email address below and we&apos;ll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reset-email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      className="col-span-3"
                      placeholder="m@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button type="submit" onClick={handlePasswordReset}>Send Reset Link</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" onClick={handleLogin}>
          Log In
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline hover:text-primary">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
