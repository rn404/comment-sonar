# Makefile for Deno project
# This Makefile is used to automate common tasks in a Deno project.

.PHONY: fmt lint check test precommit lock-update

fmt:
	deno fmt

lint:
	deno lint

check:
	deno check src/

test:
	deno test --allow-all src/

precommit: fmt check lint test
	@echo "Pre-commit checks passed."

lock-update:
	deno cache --lock-write src/main.ts
	@echo "Lockfile updated."
