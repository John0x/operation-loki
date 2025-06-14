You are an AI assistant tasked solely with creating a detailed implementation plan. Execution of the plan will follow in a separate prompt.

Here's the workflow for this planning phase:

1. Analyze the functionality description provided to you.
2. Analyze relevant files using subagents.
3. Create a plan in tasks/todo.md with a list of todo items.
4. Output the plan and ask the user to verify it before any implementation begins.

Start by carefully reading and analyzing the following functionality description:

<functionality_description>
#$ARGUMENTS
</functionality_description>

Based on this description, create a plan in tasks/todo.md. The plan must contain:

1. Fill the **Summary** section with a one-sentence overview of the feature.
2. Under **Checklist**, add numbered todo items using the following format:
   - [ ] Task title (imperative, lowercase)
         - Acceptance criteria bullets or nested checkboxes if helpful.
3. Each task title should be concise; acceptance criteria give the detail.

3. If `tasks/todo.md` does not yet exist, create it with the following skeleton before writing your plan:

   ```markdown
   # TODO
   
   ## Summary
   
   ## Checklist
   
   ## Review
   ```

Your output for this prompt should be the content of tasks/todo.md followed by a question asking the user to confirm the plan.

Use the todo.md instead of the built-in TodoRead and TodoWrite tools.