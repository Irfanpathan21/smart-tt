import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Trash2, Plus } from 'lucide-react';

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  specializations: string[];
  maxHoursPerWeek: number;
  availability: {
    [day: string]: string[]; // Array of time slots
  };
}

interface FacultyManagerProps {
  faculty: Faculty[];
  onFacultyChange: (faculty: Faculty[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00'
];

export function FacultyManager({ faculty, onFacultyChange }: FacultyManagerProps) {
  const [newFaculty, setNewFaculty] = useState<Omit<Faculty, 'id'>>({
    name: '',
    email: '',
    department: '',
    specializations: [],
    maxHoursPerWeek: 12,
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    }
  });

  const addFaculty = () => {
    if (newFaculty.name && newFaculty.email) {
      const facultyMember: Faculty = {
        ...newFaculty,
        id: Date.now().toString()
      };
      onFacultyChange([...faculty, facultyMember]);
      setNewFaculty({
        name: '',
        email: '',
        department: '',
        specializations: [],
        maxHoursPerWeek: 12,
        availability: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: []
        }
      });
    }
  };

  const removeFaculty = (id: string) => {
    onFacultyChange(faculty.filter(f => f.id !== id));
  };

  const handleAvailabilityChange = (day: string, timeSlot: string, checked: boolean) => {
    const currentSlots = newFaculty.availability[day] || [];
    const updatedSlots = checked
      ? [...currentSlots, timeSlot]
      : currentSlots.filter(slot => slot !== timeSlot);

    setNewFaculty({
      ...newFaculty,
      availability: {
        ...newFaculty.availability,
        [day]: updatedSlots
      }
    });
  };

  const addSpecialization = (specialization: string) => {
    if (specialization && !newFaculty.specializations.includes(specialization)) {
      setNewFaculty({
        ...newFaculty,
        specializations: [...newFaculty.specializations, specialization]
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Faculty Member</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facultyName">Name</Label>
              <Input
                id="facultyName"
                value={newFaculty.name}
                onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div>
              <Label htmlFor="facultyEmail">Email</Label>
              <Input
                id="facultyEmail"
                type="email"
                value={newFaculty.email}
                onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                placeholder="jane.smith@university.edu"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={newFaculty.department}
                onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                placeholder="Computer Science"
              />
            </div>
            <div>
              <Label htmlFor="maxHours">Max Hours per Week</Label>
              <Input
                id="maxHours"
                type="number"
                value={newFaculty.maxHoursPerWeek}
                onChange={(e) => setNewFaculty({ ...newFaculty, maxHoursPerWeek: parseInt(e.target.value) || 0 })}
                min="1"
                max="40"
              />
            </div>
          </div>

          <div>
            <Label>Specializations</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add specialization and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSpecialization(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {newFaculty.specializations.map(spec => (
                <Badge key={spec} variant="secondary" className="cursor-pointer"
                       onClick={() => setNewFaculty({
                         ...newFaculty,
                         specializations: newFaculty.specializations.filter(s => s !== spec)
                       })}>
                  {spec} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Availability</Label>
            <div className="grid grid-cols-5 gap-4 mt-2">
              {DAYS.map(day => (
                <div key={day} className="border rounded p-3">
                  <h4 className="mb-2">{day}</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {TIME_SLOTS.map(timeSlot => (
                      <div key={timeSlot} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${day}-${timeSlot}`}
                          checked={newFaculty.availability[day]?.includes(timeSlot) || false}
                          onCheckedChange={(checked) => 
                            handleAvailabilityChange(day, timeSlot, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${day}-${timeSlot}`} className="text-xs">
                          {timeSlot}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={addFaculty} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Faculty Member
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3>Faculty Members ({faculty.length})</h3>
        {faculty.map(facultyMember => (
          <Card key={facultyMember.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4>{facultyMember.name}</h4>
                    <Badge variant="outline">{facultyMember.department}</Badge>
                    <Badge>{facultyMember.maxHoursPerWeek}h/week</Badge>
                  </div>
                  <p className="text-muted-foreground">{facultyMember.email}</p>
                  {facultyMember.specializations.length > 0 && (
                    <div>
                      <span className="text-sm">Specializations: </span>
                      {facultyMember.specializations.map(spec => (
                        <Badge key={spec} variant="secondary" className="mr-1">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div>
                    <span className="text-sm">Available: </span>
                    {DAYS.map(day => {
                      const daySlots = facultyMember.availability[day] || [];
                      return daySlots.length > 0 ? (
                        <Badge key={day} variant="outline" className="mr-1">
                          {day} ({daySlots.length} slots)
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => removeFaculty(facultyMember.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}