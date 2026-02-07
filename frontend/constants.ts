
import { Course, Task, TimeBlock } from './types';

export const MOCK_COURSES: Course[] = [
  { 
    id: '1', 
    code: 'CS301', 
    name: 'Advanced Algorithms', 
    syllabusProcessed: true, 
    instructor: 'Dr. Turing', 
    canvasConnected: true,
    icon: 'terminal',
    syllabusSummary: 'Deep dive into complex data structures, graph theory, and dynamic programming. Focus on O(n) optimization.'
  },
  { 
    id: '2', 
    code: 'HIST102', 
    name: 'Modern World History', 
    syllabusProcessed: true, 
    instructor: 'Prof. Miller', 
    canvasConnected: true,
    icon: 'scroll',
    syllabusSummary: 'Analysis of global events from 1750 to present, emphasizing the impact of industrialization and decolonization.'
  },
  { 
    id: '3', 
    code: 'ECON201', 
    name: 'Microeconomics', 
    syllabusProcessed: true, 
    instructor: 'Dr. Smith', 
    canvasConnected: false,
    icon: 'trending-up',
    syllabusSummary: 'Study of individual and firm behavior, market structures, and public policy implications in competitive markets.'
  },
];
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const MOCK_SCHEDULE_BLOCKS: TimeBlock[] = [
  // CS301
  { id: 'b1', day: 'Mon', startTime: 9, duration: 2, title: 'CS301: Algorithms Lecture', type: 'class', color: 'bg-blue-600' },
  { id: 'b2', day: 'Wed', startTime: 9, duration: 2, title: 'CS301: Algorithms Lecture', type: 'class', color: 'bg-blue-600' },
  { id: 'b3', day: 'Fri', startTime: 14, duration: 1.5, title: 'CS301: Lab Session', type: 'class', color: 'bg-blue-500' },
  
  // HIST102
  { id: 'b4', day: 'Tue', startTime: 11, duration: 1.5, title: 'HIST102: World History', type: 'class', color: 'bg-indigo-600' },
  { id: 'b5', day: 'Thu', startTime: 11, duration: 1.5, title: 'HIST102: World History', type: 'class', color: 'bg-indigo-600' },
  
  // ECON201
  { id: 'b6', day: 'Mon', startTime: 13, duration: 1.5, title: 'ECON201: Microeconomics', type: 'class', color: 'bg-emerald-600' },
  { id: 'b7', day: 'Wed', startTime: 13, duration: 1.5, title: 'ECON201: Microeconomics', type: 'class', color: 'bg-emerald-600' },
  
  // Study Blocks
  { id: 'b8', day: 'Tue', startTime: 15, duration: 2, title: 'Focus: Algorithm Study', type: 'focus', color: 'bg-slate-800' },
  { id: 'b9', day: 'Sat', startTime: 10, duration: 3, title: 'Deep Work: History Essay', type: 'focus', color: 'bg-slate-800' },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    courseId: '1',
    title: 'Dijkstra Implementation Lab',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    type: 'assignment',
    completed: false,
    points: 100,
    riskScore: 8,
    description: 'Implement Dijkstra algorithm using a priority queue in Python. Must handle negative edge weights with a warning.',
    materials: ['Syllabus.pdf', 'Lecture-4-Graphs.pptx']
  },
  {
    id: 't2',
    courseId: '2',
    title: 'Midterm Essay Draft',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    type: 'project',
    completed: false,
    points: 50,
    riskScore: 4,
    description: 'A 1500-word draft focusing on the industrial revolution impacts in Southeast Asia.',
  },
  {
    id: 't3',
    courseId: '1',
    title: 'Final Project Pitch',
    deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
    type: 'assignment',
    completed: false,
    points: 200,
    riskScore: 6,
    description: '3-minute pitch for the final project topic. Needs a slide deck.',
  },
  {
    id: 't4',
    courseId: '2',
    title: 'Weekly Reading Reflection',
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    type: 'assignment',
    completed: false,
    points: 10,
    riskScore: 2,
    description: 'Reflect on Chapters 4-6 of the textbook.',
  },
  {
    id: 't5',
    courseId: '3',
    title: 'Supply & Demand Problem Set',
    deadline: new Date(Date.now() + 86400000 * 6).toISOString(),
    type: 'assignment',
    completed: false,
    points: 20,
    riskScore: 3,
  },
  {
    id: 't6',
    courseId: '1',
    title: 'Graph Theory Quiz',
    deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
    type: 'quiz',
    completed: false,
    points: 30,
    riskScore: 5,
  },
];

export const COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};
