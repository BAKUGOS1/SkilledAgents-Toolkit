from __future__ import annotations

import sys

from openai_codex import Codex, Sandbox


prompt = " ".join(sys.argv[1:]) or (
    "Inspect this repository and summarize the available skills and agents."
)

with Codex() as codex:
    thread = codex.thread_start(sandbox=Sandbox.workspace_write)
    result = thread.run(prompt)
    print(result.final_response)

