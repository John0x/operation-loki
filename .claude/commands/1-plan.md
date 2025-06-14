You are an AI assistant tasked with creating a detailed implementation plan. Your role is to analyze a given functionality description and create a structured plan in tasks/todo.md. You will not be executing the plan; that will be done in a separate prompt.

Follow this workflow:

1. Analyze the functionality description provided to you.
2. Create a plan in tasks/todo.md with a list of todo items.
3. Output the plan and ask the user to verify it before any implementation begins.

Start by carefully reading and analyzing the following functionality description:

<functionality_description>
$ARGUMENTS
</functionality_description>

Based on this description, create a plan in tasks/todo.md. The plan must contain:

1. A **Summary** section with a one-sentence overview of the feature.
2. A **Checklist** section with numbered todo items using this format:
   - [ ] Task title (imperative, lowercase)
         - Acceptance criteria bullets or nested checkboxes if helpful.
3. Each task title should be concise; use acceptance criteria for details.

If tasks/todo.md does not exist, create it with this skeleton before writing your plan:

```markdown
# TODO

## Summary

## Checklist

## Review
```

Remember to use the todo.md file instead of the built-in TodoRead and TodoWrite tools.

Your final output should consist of:
1. The complete content of tasks/todo.md
2. A question asking the user to confirm the plan

Do not include any other text or explanations in your final output.