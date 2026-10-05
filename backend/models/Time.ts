import type { Worker } from "../type/types.js";
import { PoolClient } from "pg";
export function generateWorkerSlots(worker:Worker) {
  const totalHours = worker.employment_type === 'part_time'
    ? worker.hour_per_day
    : 8;

  const numSlots = Math.floor(totalHours! / 2);
  const slots = [];
  let [h, m] = worker.available_from.split(':').map(Number);

  for (let i = 0; i < numSlots; i++) {
    const start = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    h += 2;
    const end = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    slots.push({ start_time: start, end_time: end });
  }
    console.log(slots);

  return slots;
 // e.g. part_time hour_per_day=4 → 2 objects; full_time 9-5 → 4 objects
}
export async function findOrCreateTimeSlot(client:PoolClient, start:string, end:string) {
  const label = `${start}-${end}`;
  const existing = await client.query(
    'SELECT id FROM time_slot WHERE start_time = $1 AND end_time = $2', [start, end]
  );
  if (existing.rows.length) return existing.rows[0].id;

  const created = await client.query(
    'INSERT INTO time_slot (label, start_time, end_time) VALUES ($1,$2,$3) RETURNING id',
    [label, start, end]
  );
  return created.rows[0].id;
}