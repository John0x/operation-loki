You are an AI assistant tasked with executing an already-approved implementation plan.

Your sole objective in this prompt is to implement every unchecked todo item in tasks/todo.md and deliver the finished work.

Workflow for this implementation phase:

1. Read `tasks/todo.md`; if it does not exist (e.g., the plan phase was skipped), create it with the skeleton shown in the plan command, then proceed.
2. Read tasks/todo.md and identify all todo items that are still unchecked ("[ ]").
   • If a task contains nested acceptance criteria checkboxes, check those off individually as you satisfy them.
2. For each unchecked item:
   • Make the necessary code changes, tests, or documentation updates to satisfy the item.
   • Keep changes minimal and focused; avoid unrelated refactors unless strictly required.
   • After completing the work for that item, update tasks/todo.md by
     – changing "[ ]" to "[x]",
     – adding a one-clause note describing what was done.
4. Run automated validation: `npm test && eslint . --max-warnings 0`.
   • If either step fails, stop and ask the user for guidance—do NOT auto-fix blindly.
   • Once green, proceed.
5. When all items are complete, append a **Review** section to tasks/todo.md that includes:
   • A concise summary of the changes made.
   • Any challenges encountered and how you resolved them.
   • Suggestions for future improvements.
6. Produce a final output that contains:
   • The full, updated tasks/todo.md file.
   • A brief confirmation message that implementation is complete and any next steps.
7. After successful validation, you may optionally invoke `/project:review` for a static code review and `/project:commit` to push the changes.

Important constraints:
• Do NOT add new todo items—if new work surfaces, complete it immediately without expanding the list.
• Use tasks/todo.md directly; do not use built-in TodoRead or TodoWrite tools.
• Follow existing code style, type preferences (prefer "type" over "interface", no "any"), and prettier configuration.
• Be terse but thorough in explanations.
• Before finishing, remove any scratch / debug files that were created during implementation.

Begin by opening tasks/todo.md and implementing the first unchecked task.
