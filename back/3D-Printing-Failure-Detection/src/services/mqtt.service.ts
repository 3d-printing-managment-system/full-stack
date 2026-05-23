import mqtt from "mqtt";

const client = mqtt.connect(process.env.MQTT_BROKER_URL!, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  keepalive: 60,
  clean: true,
  clientId: `backend-listener-${Math.random().toString(16).substring(2, 8)}`,
});

client.on("connect", () => {
  console.log("✅ MQTT publisher connected");
});

client.on("error", (err) => {
  console.error("❌ MQTT error:", err);
});

//start job

export const publishStartJob = ({
  printerId,
  jobId,
  fileUrl,
}: {
  printerId: string;
  jobId: string;
  fileUrl: string;
}) => {
  const topic = `printers/${printerId}/start-job`;

  const payload = {
    printerId,
    jobId,
    commandName: "START_JOB",
    fileUrl,
  };

  client.publish(topic, JSON.stringify(payload), {
    qos: 1,
  });

  console.log("📤 START_JOB SENT:", payload);
};

//printer commands

export const publishPrinterCommand = ({
  printerId,
  commandLogId,
  commandName,
  gcode,
}: {
  printerId: string;
  commandLogId: string;
  commandName: string;
  gcode: string;
}) => {
  const topic = `printers/${printerId}/command`;

  const payload = {
    printerId,
    commandLogId,
    commandName,
    gcode,
  };

  client.publish(topic, JSON.stringify(payload), {
    qos: 1,
  });

  console.log("📤 COMMAND SENT:", payload);
};

// printer paused and resymed and canceled job 
export const publishPauseJobCommand = ({
  printerId,
  jobId,
}: {
  printerId: string;
  jobId: string;
}) => {
  client.publish(
    `printers/${printerId}/pause-job`,
    JSON.stringify({
      printerId,
      jobId,
    }),
    { qos: 1 }
  );

  console.log("📤 PAUSE COMMAND SENT");
};

export const publishResumeJobCommand = ({
  printerId,
  jobId,
}: {
  printerId: string;
  jobId: string;
}) => {
  client.publish(
    `printers/${printerId}/resume-job`,
    JSON.stringify({
      printerId,
      jobId,
    }),
    { qos: 1 }
  );

  console.log("📤 RESUME COMMAND SENT");
};

export const publishCancelJobCommand = ({
  printerId,
  jobId,
}: {
  printerId: string;
  jobId: string;
}) => {
  client.publish(
    `printers/${printerId}/cancel-job`,
    JSON.stringify({
      printerId,
      jobId,
    }),
    { qos: 1 }
  );

  console.log("📤 CANCEL COMMAND SENT");
};

export default client;
