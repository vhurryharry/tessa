const { Router } = require("express");

const { collectionEnvelope, itemEnvelope } = require("./responseEnvelopes");
const { listStatements, createStatement } = require("./statementsService");
const { isAdmin } = require("./authMiddleware");
const { UnprocessableEntityError } = require("./httpErrors");
const { isNonWhitespaceOnlyString, isValidId } = require("./validators");

const statementsRouter = new Router();

statementsRouter.get("/", async (req, res, next) => {
  let statements;
  try {
    statements = await listStatements();
  } catch (e) {
    next(e);
    return;
  }
  res.json(collectionEnvelope(statements, statements.length));
});

statementsRouter.post("/", isAdmin, async (req, res, next) => {
  if (
    typeof req.body !== "object" ||
    !("assertion" in req.body) ||
    !("facet_id" in req.body) ||
    !("sort_order" in req.body)
  ) {
    next(
      new UnprocessableEntityError(
        'The request body must be an object with "assertion", "facet_id" and "sort_order" properties.'
      )
    );
    return;
  }
  const { assertion, facet_id: facetId, sort_order: sortOrder } = req.body;
  if (!isNonWhitespaceOnlyString(assertion)) {
    next(new UnprocessableEntityError('"assertion" must contain text.'));
    return;
  }
  if (!isValidId(facetId)) {
    next(new UnprocessableEntityError(`"${facetId}" is not a valid facet ID.`));
    return;
  }
  if (!Number.isSafeInteger(sortOrder)) {
    next(new UnprocessableEntityError('"sort_order" must be an integer.'));
    return;
  }
  let statement;
  try {
    statement = await createStatement(assertion, facetId, sortOrder);
  } catch (e) {
    next(e);
    return;
  }
  res.status(201).json(itemEnvelope(statement));
});

module.exports = statementsRouter;
