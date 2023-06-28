import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { Conversation, Message } from 'src/app/shared/models/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ChatExportService {
  //WIP: export conversation to xlsx should be done in backend

  async exportToXLSX(conversation: Conversation): Promise<void> {
    const wb = new Workbook();
    const ws = wb.addWorksheet('Conversation');

    const wsData = this.createXLSXData(conversation);
    ws.addRows(wsData);

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `chat_${conversation.topic}.xlsx`);
}

  private createXLSXData(conversation: Conversation): any[][] {
    const userRows = conversation.users.map(user => ['Shared with User(s): ' + user.email]);

    const topicRow = ['Topic: ' + conversation.topic];

    const header = [
      [
        'ID',
        'Content',
        'Origin',
        'Length',
        'Model',
        'Timestamp'
      ]
    ];

    let messageRows: any[] = [];
    if (conversation.blobs) {
      messageRows = conversation.blobs.map(message => {
        return [
          message.id,
          '"' + message.content + '"',
          message.origin,
          message.length,
          message.model,
          message.timestamp
        ];
      });
    }

    return [...userRows, topicRow, ...header, ...messageRows];
  }
}
