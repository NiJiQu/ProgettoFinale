import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Recipe } from 'src/app/models/recipe.model';
import { RecipeService } from 'src/app/services/recipe.service';
import { MessageService } from 'primeng/api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modify1',
  templateUrl: './modify1.component.html',
  styleUrls: ['./modify1.component.scss']
})
export class Modify1Component implements OnInit {
  @Input() id: string;
  @Output() messaggio = new EventEmitter();

  ricetta: Recipe;

  editor = ClassicEditor;

  editorConfig = {
    toolbar: {
        items: [
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'codeBlock',
            'undo',
            'redo',
        ]
    },
    image: {
        toolbar: [
            'imageStyle:full',
            'imageStyle:side',
            '|',
            'imageTextAlternative'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    height: 300,
};

  form = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    image: new FormControl(''),
    difficulty: new FormControl(0),
    published: new FormControl(false)
  })

  constructor(
    private recipeService: RecipeService,
    private messageService: MessageService,
    private modalService: NgbModal
    ) { }

  ngOnInit(): void {
    this.recipeService.getRecipe(this.id).subscribe({
      next: (res) => {
        this.ricetta = res;
        this.form.patchValue({
          title: this.ricetta.title,
          description : this.ricetta.description,
          image: this.ricetta.image,
          difficulty: this.ricetta.difficulty,
          published: this.ricetta.published
        });
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  onSubmit(){
    this.ricetta.title = this.form.value.title;
    this.ricetta.description = this.form.value.description;
    this.ricetta.image = this.form.value.image;
    this.ricetta.difficulty = this.form.value.difficulty;
    this.ricetta.published = this.form.value.published;

    this.recipeService.updateRecipe(this.ricetta).subscribe({
      next: (res) => {
        this.messageService.add({severity:'success', summary:'Successo', detail:'Ricetta modificata con successo', life: 3000});
      },
      error: (err) => {
        console.log(err);
        this.messageService.add({severity:'error', summary:'Errore', detail: "Errore nella modifica"});
      }
    });
  }

  mandaMessaggio() {
    this.messaggio.emit();
  }
}
