import { Component, type ReactNode } from "react";
import { Alert, Button, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.error) {
      return (
        <Stack align="center" justify="center" h="100vh" px="xl">
          <Alert
            icon={<IconAlertCircle />}
            title="Something went wrong"
            color="red"
            radius="xl"
            maw={480}
            w="100%"
          >
            <Text size="sm" mb="md">{this.state.error.message}</Text>
            <Button onClick={this.handleReset} color="red" variant="light" radius="md">
              Return to Home
            </Button>
          </Alert>
        </Stack>
      );
    }
    return this.props.children;
  }
}
