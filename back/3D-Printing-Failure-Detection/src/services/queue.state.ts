let processingEnabled = false;

export const isProcessingEnabled = () => processingEnabled;

export const enableProcessing = () => {
  processingEnabled = true;
  console.log("✅ Queue processing enabled");
};

export const disableProcessing = () => {
  processingEnabled = false;
  console.log("🛑 Queue processing stopped");
};