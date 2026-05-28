import { zodResolver } from "@hookform/resolvers/zod";
import { Anchor, Button, Card, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import type { Location } from "react-router-dom";

import { useAuthStore, type AuthState } from "../store/authStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state: AuthState) => state.login);
  const loading = useAuthStore((state: AuthState) => state.loading);
  const error = useAuthStore((state: AuthState) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    await login(values);
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/";
    navigate(redirectTo, { replace: true });
  };

  return (
    <Stack align="center" justify="center" h="100%">
      <Card shadow="lg" radius="lg" padding="xl" w={420}>
        <Title order={2} ta="center" mb="lg">
          Welcome back
        </Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput label="Email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...register("password")}
              error={errors.password?.message}
            />
            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}
            <Button type="submit" loading={loading} fullWidth>
              Sign in
            </Button>
          </Stack>
        </form>
        <Text size="sm" c="dimmed" mt="md" ta="center">
          New to the platform? <Anchor component={Link} to="/register">Create an account</Anchor>
        </Text>
      </Card>
    </Stack>
  );
}
