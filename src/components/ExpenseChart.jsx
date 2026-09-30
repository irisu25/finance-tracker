import { Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Dipisah + lazy-load dari App agar recharts tidak masuk bundle awal (mobile).
export default function ExpenseChart({ data, config }) {
  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie data={data} dataKey="amount" nameKey="category" innerRadius={60} strokeWidth={5} />
      </PieChart>
    </ChartContainer>
  )
}
