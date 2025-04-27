# Makefile for Deno project
# This Makefile is used to automate common tasks in a Deno project.

DENO_CONFIG = .config/deno.json

.PHONY: fmt lint check test precommit

fmt:
	deno fmt -c $(DENO_CONFIG)

lint:
	deno lint -c $(DENO_CONFIG)

check:
	deno check src/ -c $(DENO_CONFIG)

test:
	deno test -c $(DENO_CONFIG) --allow-all src/

precommit: fmt check lint test
	@echo "Pre-commit checks passed."
