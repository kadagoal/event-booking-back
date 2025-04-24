import { Controller, Post, Body, UseGuards, Get, Query, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CognitoAuthGuard } from 'src/common/auth/cognito-auth.guard';
import { Param, Put } from '@nestjs/common';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(CognitoAuthGuard)
  create(@Body() createEventDto: CreateEventDto, @Req() req) {
    return this.eventsService.create(createEventDto, req.user.sub);
  }
  
  @Get('my-events')
  @UseGuards(CognitoAuthGuard)
  findMyEvents(@Req() req) {
    return this.eventsService.findByCreator(req.user.sub);
  }


  @Put(':id')
  @UseGuards(CognitoAuthGuard)
  update(@Param('id') id: string, @Body() updateData: Partial<CreateEventDto>) {
    return this.eventsService.update(id, updateData);
  }


  @Get('search')
  findByFilters(
    @Query('title') title?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('startDate') startDate?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.eventsService.search(title, category, location, startDate, Number(page), Number(limit));
  }

}