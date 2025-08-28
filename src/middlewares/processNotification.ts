/*
 * Middleware to process notification and respond with PROCESS_NOTIFICATION
 */
export function processNotification(_req: any, res: any) {
  return res.status(202).json({ decision: "PROCESS_NOTIFICATION" });
}
