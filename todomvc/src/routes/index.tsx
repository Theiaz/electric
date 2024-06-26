import {
  Container,
  Flex,
  Checkbox,
  Heading,
  Text,
  TextField,
  Button,
  Link,
} from "@radix-ui/themes"
import { useShape } from "../../../use-shape"
import { useOptimistic } from "react"
import { v4 as uuidv4 } from "uuid"

export default function Index() {
  const todos = useShape({
    shape: { table: `todos` },
    baseUrl: `http://localhost:3000`,
  })
  todos.sort((a, b) => a.created_at - b.created_at)
  console.log({ todos })
  return (
    <Container size="1">
      <Flex gap="5" mt="5" direction="column">
        <Heading>Electric TODOS</Heading>

        <Flex gap="3" direction="column">
          {todos.map((todo) => {
            return (
              <Flex key={todo.id} gap="2" align="center">
                <Text as="label">
                  <Flex gap="2" align="center">
                    <Checkbox
                      checked={todo.completed}
                      onClick={async () => {
                        console.log(`completed`)
                        await fetch(`http://localhost:3000/todos/${todo.id}`, {
                          method: `PUT`,
                          headers: {
                            "Content-Type": `application/json`,
                          },
                          body: JSON.stringify({ completed: !todo.completed }),
                        })
                      }}
                    />
                    {todo.title}
                  </Flex>
                </Text>
                <Link
                  underline="always"
                  ml="auto"
                  style={{ cursor: `pointer` }}
                  onClick={async () => {
                    console.log(`deleted`)
                    await fetch(`http://localhost:3000/todos/${todo.id}`, {
                      method: `DELETE`,
                    })
                  }}
                >
                  x
                </Link>
              </Flex>
            )
          })}
        </Flex>
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            const id = uuidv4()
            const formData = Object.fromEntries(new FormData(event.target))
            const res = await fetch(`http://localhost:3000/todos`, {
              method: `POST`,
              headers: {
                "Content-Type": `application/json`,
              },
              body: JSON.stringify({ id, title: formData.todo }),
            })
            console.log({ res })
          }}
        >
          <TextField.Root type="text" name="todo" placeholder="New Todo" />
        </form>
      </Flex>
    </Container>
  )
}
