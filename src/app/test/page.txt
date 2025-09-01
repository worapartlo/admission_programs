// components/SlideCard.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

// TypeScript interfaces
interface SlideCardProps {
  children?: React.ReactNode
}

interface SlideViewProps {
  isActive: boolean
  direction: 'left' | 'right'
  children: React.ReactNode
}

// หลักการ 1: Container ที่มี overflow hidden
const SlideContainer: React.FC<{ children: React.ReactNode; currentSlide: number }> = ({ 
  children, 
  currentSlide 
}) => {
  return (
    <div className="relative w-full h-96 overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200">
      {/* Sliding wrapper - หลักการสำคัญคือการใช้ transform translateX */}
      <div 
        className={`
          flex w-full h-full
          transition-transform duration-500 ease-in-out
          transform
        `}
        style={{
          // หลักการ: เลื่อน container ตาม currentSlide
          // slide 0 = translateX(0%)     - แสดง slide แรก
          // slide 1 = translateX(-100%)  - แสดง slide ที่สอง
          // slide 2 = translateX(-200%)  - แสดง slide ที่สาม
          transform: `translateX(-${currentSlide * 100}%)`
        }}
      >
        {children}
      </div>
    </div>
  )
}

// หลักการ 2: แต่ละ slide จะต้องมีความกว้าง 100% ของ container
const SlideView: React.FC<SlideViewProps> = ({ children }) => {
  return (
    <div className="min-w-full h-full p-8 flex flex-col justify-center">
      {children}
    </div>
  )
}

// หลักการ 3: Hook สำหรับจัดการ slide state
const useSlideTransition = (totalSlides: number) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides)
  }
  
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides)
  }
  
  const goToSlide = (slideIndex: number) => {
    if (slideIndex >= 0 && slideIndex < totalSlides) {
      setCurrentSlide(slideIndex)
    }
  }
  
  return {
    currentSlide,
    nextSlide,
    prevSlide,
    goToSlide
  }
}

// ตัวอย่างการใช้งาน
export default function SlideTransitionExample() {
  const { currentSlide, nextSlide, prevSlide, goToSlide } = useSlideTransition(3)
  
  // Sample form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    score: ''
  })
  
  const handleSubmit = () => {
    // Process form then go to results
    goToSlide(1)
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Slide Transition Example
      </h1>
      
      {/* หลักการ 4: Slide Container */}
      <SlideContainer currentSlide={currentSlide}>
        
        {/* Slide 1: Form */}
        <SlideView isActive={currentSlide === 0} direction="left">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              📝 กรอกข้อมูล
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="กรอกชื่อของคุณ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  คะแนน
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.score}
                  onChange={(e) => setFormData(prev => ({...prev, score: e.target.value}))}
                  placeholder="กรอกคะแนนของคุณ"
                />
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              ดูผลลัพธ์ →
            </button>
          </div>
        </SlideView>
        
        {/* Slide 2: Results */}
        <SlideView isActive={currentSlide === 1} direction="right">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              🎉 ผลลัพธ์
            </h2>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                ยินดีด้วย {formData.name}!
              </h3>
              <p className="text-slate-600 mb-4">
                คะแนนของคุณ: <span className="font-bold text-2xl text-green-600">{formData.score}</span>
              </p>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(parseInt(formData.score) || 0, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => goToSlide(0)}
                className="flex-1 px-4 py-3 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
              >
                ← กลับไปแก้ไข
              </button>
              <button
                onClick={() => goToSlide(2)}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                ดูรายละเอียด →
              </button>
            </div>
          </div>
        </SlideView>
        
        {/* Slide 3: Details */}
        <SlideView isActive={currentSlide === 2} direction="right">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              📊 รายละเอียดเพิ่มเติม
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">ข้อมูลที่กรอก:</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>• ชื่อ: {formData.name}</li>
                  <li>• อีเมล: {formData.email}</li>
                  <li>• คะแนน: {formData.score}</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 mb-2">การประเมิน:</h4>
                <p className="text-blue-600 text-sm">
                  {parseInt(formData.score) >= 80 ? 'คะแนนของคุณอยู่ในระดับดีมาก!' :
                   parseInt(formData.score) >= 60 ? 'คะแนนของคุณอยู่ในระดับดี!' :
                   'คุณควรปรับปรุงคะแนนเพิ่มเติม'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => goToSlide(0)}
              className="w-full mt-6 px-6 py-3 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              ← เริ่มต้นใหม่
            </button>
          </div>
        </SlideView>
        
      </SlideContainer>
      
      {/* หลักการ 5: Slide Indicators (Optional) */}
      <div className="flex justify-center gap-2 mt-6">
        {[0, 1, 2].map((slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            title={`ไปยังสไลด์ที่ ${slideIndex + 1}`}
            aria-label={`ไปยังสไลด์ที่ ${slideIndex + 1}`}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === slideIndex ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// หลักการ 6: Advanced - Slide with Animation Direction
interface AdvancedSlideProps {
  children: React.ReactNode
  currentSlide: number
  direction: 'next' | 'prev'
}

const AdvancedSlideContainer: React.FC<AdvancedSlideProps> = ({ 
  children, 
  currentSlide, 
  direction 
}) => {
  return (
    <div className="relative w-full h-96 overflow-hidden bg-white rounded-2xl shadow-xl">
      <div 
        className={`
          flex w-full h-full
          transition-transform duration-500 ease-in-out
        `}
        style={{
          transform: `translateX(-${currentSlide * 100}%)`
        }}
      >
        {children}
      </div>
      
      {/* Optional: Add slide direction animation */}
      <div className={`
        absolute inset-0 pointer-events-none
        ${direction === 'next' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
      `} />
    </div>
  )
}