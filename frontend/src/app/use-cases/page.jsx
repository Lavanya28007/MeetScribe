import React from 'react'

const UseCases = () => {
    return (
        <div className="min-h-screen bg-[#FAFAF8] px-6 py-16">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-5xl text-center font-bold mb-10 text-gray-900">Use <span className="text-orange-600">Cases</span></h1>


                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {useCases.map((c, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-semibold mb-2 text-gray-900">{c.title}</h3>
                            <p className="text-gray-600">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
const useCases = [
    { title: 'Teams & Startups', desc: 'Standups, sprint planning, and retrospectives.' },
    { title: 'Enterprises', desc: 'Client calls, reviews, and internal meetings.' },
    { title: 'Education', desc: 'Online lectures and academic discussions.' },
    { title: 'Freelancers', desc: 'Client requirement and project meetings.' },
    { title: 'HR & Recruitment', desc: 'Interviews and hiring evaluations.' }
]

export default UseCases;