export function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Unique constraint violation" });
  }
  if (err.code === "P2003") {
    return res.status(400).json({ error: "Invalid reference (foreign key)" });
  }

  const dev = process.env.NODE_ENV === "development";
  res.status(500).json({
    error: "Internal server error",
    ...(dev && err.message ? { details: err.message } : {}),
  });
}
