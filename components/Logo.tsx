import { AnimatedLogoMark } from '@/components/AnimatedBrandLogo'

export default function Logo({ className = 'h-10 w-auto' }: { className?: string }) {
  return <AnimatedLogoMark className={className} gradientId="adminLogoMarkGradient" />
}
