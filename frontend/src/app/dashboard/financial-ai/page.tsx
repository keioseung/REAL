"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/sidebar'
import useFinancialAIInfo from '@/hooks/use-financial-ai-info'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
// ... (이하 기존 dashboard/page.tsx와 동일, 내부 훅/쿼리키/API만 financial_ 네이밍으로 변경) 