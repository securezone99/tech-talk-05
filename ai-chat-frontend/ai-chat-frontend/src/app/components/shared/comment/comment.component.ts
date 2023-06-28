import { Component } from '@angular/core';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {

  commentList = [
    {
        shortName: 'JS',
        shortNameBgColor: '#415385',
        shortNameFontColor: '#ffffff',
        fullName: 'Jamie Sutton',
        commentsTime: '3 hours ago',
        commentsContent: `Copilot 2 Project`
    },
    {
        shortName: 'EL',
        shortNameBgColor: '#415385',
        shortNameFontColor: '#ffffff',
        fullName: 'Ernesto Laborda',
        commentsTime: '28 min ago',
        likesCount: 2,
        liked: true,
        commentsCount: 1,
        commentsContent: `Nunc feugiat vitae leo at molestie. Donec feugiat nunc a aliquet dignissim.
            Proin ut euismod urna, id pulvinar erat.`
    }
  ];

  onLikeStatusChange(event: any) {
    let currentItem = this.commentList.find((item: any) => item === event);
    if (currentItem) {
        currentItem.liked = !currentItem.liked;
        currentItem.likesCount && (currentItem.liked ? currentItem.likesCount++ : currentItem.likesCount--);
    }
  }

  onCommentClick(event: any) {
  }
}
