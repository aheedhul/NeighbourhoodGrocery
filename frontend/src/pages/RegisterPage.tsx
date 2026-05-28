import { zodResolver } from "@hookform/resolvers/zod";
import { Anchor, Button, Card, NativeSelect, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore, type AuthState } from "../store/authStore";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "OWNER", "DELIVERY"])
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state: AuthState) => state.register);
  const loading = useAuthStore((state: AuthState) => state.loading);
  const error = useAuthStore((state: AuthState) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await registerUser(values);
    navigate("/", { replace: true });
  };

  return (
    <Stack align="center" justify="center" h="100%">
      <Card shadow="lg" radius="lg" padding="xl" w={480}>
        <Title order={2} ta="center" mb="lg">
          Create your account
        </Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput label="Name" placeholder="Enter name" {...register("name")} error={errors.name?.message} />
            <TextInput label="Email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
            <PasswordInput
              label="Password"
              placeholder="Enter a secure password"
              {...register("password")}
              error={errors.password?.message}
            />
            <NativeSelect
              label="Role"
              data={[
                { label: "Customer", value: "CUSTOMER" },
                { label: "Store Owner", value: "OWNER" },
                { label: "Delivery Associate", value: "DELIVERY" }
              ]}
              {...register("role")}
            />
            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}
            <Button type="submit" loading={loading} fullWidth>
              Register
            </Button>
          </Stack>
        </form>
        <Text size="sm" c="dimmed" mt="md" ta="center">
          Already registered? <Anchor component={Link} to="/login">Sign in</Anchor>
        </Text>
      </Card>
    </Stack>
  );
}
