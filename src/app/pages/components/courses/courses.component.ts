import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { Course } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  form!: FormGroup;
  courses: Course[] = [];
  editingIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    this.courses = [...this.cvDataService.getCvData().courses];
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      institucion: [''],
      fecha: [''],
      url: [''],
      descripcion: ['']
    });
  }

  addCourse(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const existing = this.editingIndex != null ? this.courses[this.editingIndex] : null;
    const v = this.form.getRawValue() as {
      nombre: string;
      institucion: string;
      fecha: string;
      url: string;
      descripcion: string;
    };

    const course: Course = {
      id: existing ? existing.id : this.generateId(),
      nombre: (v.nombre || '').trim(),
      institucion: (v.institucion || '').trim() || undefined,
      fecha: (v.fecha || '').trim() || undefined,
      url: (v.url || '').trim() || undefined,
      descripcion: (v.descripcion || '').trim() || undefined,
      visible: existing?.visible ?? true
    };

    if (this.editingIndex != null) {
      this.courses[this.editingIndex] = course;
      this.editingIndex = null;
    } else {
      this.courses.push(course);
    }

    this.cvDataService.setCourses([...this.courses]);

    this.form.reset({
      nombre: '',
      institucion: '',
      fecha: '',
      url: '',
      descripcion: ''
    });
  }

  editCourse(index: number): void {
    const c = this.courses[index];
    this.editingIndex = index;
    this.form.reset({
      nombre: c.nombre || '',
      institucion: c.institucion || '',
      fecha: c.fecha || '',
      url: c.url || '',
      descripcion: c.descripcion || ''
    });
  }

  deleteCourse(index: number): void {
    this.courses.splice(index, 1);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.form.reset({
        nombre: '',
        institucion: '',
        fecha: '',
        url: '',
        descripcion: ''
      });
    }
    this.cvDataService.setCourses([...this.courses]);
  }

  dropCourse(event: CdkDragDrop<Course[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.courses, event.previousIndex, event.currentIndex);
    this.cvDataService.setCourses([...this.courses]);
  }

  toggleCourseVisibility(index: number): void {
    const c = this.courses[index];
    if (!c) return;
    this.courses[index] = { ...c, visible: c.visible === false ? true : false };
    this.cvDataService.setCourses([...this.courses]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
